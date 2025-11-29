provider "aws" {
  region = "us-east-2"
}

data "aws_dynamodb_table" "shared_table" {
  name = "UrlShortenerTable"
}

resource "aws_iam_role" "lambda_role" {
  name = "redirect_lambda_role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "lambda_policy" {
  name = "redirect_lambda_policy"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "dynamodb:GetItem",
          "dynamodb:UpdateItem"
        ]
        Effect   = "Allow"
        Resource = data.aws_dynamodb_table.shared_table.arn
      },
      {
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Effect   = "Allow"
        Resource = "*"
      }
    ]
  })
}

data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = "../src"
  output_path = "lambda_function.zip"
}

resource "aws_lambda_function" "redirect_lambda" {
  filename      = "lambda_function.zip"
  function_name = "RedirectService"
  role          = aws_iam_role.lambda_role.arn
  handler       = "index.handler"
  runtime       = "nodejs18.x"
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256

  environment {
    variables = {
      TABLE_NAME = data.aws_dynamodb_table.shared_table.name
    }
  }
}

resource "aws_apigatewayv2_api" "http_api" {
  name          = "RedirectAPI"
  protocol_type = "HTTP"
  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["GET", "OPTIONS"]
  }
}

resource "aws_apigatewayv2_stage" "default" {
  api_id = aws_apigatewayv2_api.http_api.id
  name   = "$default"
  auto_deploy = true
}

resource "aws_apigatewayv2_integration" "lambda_integration" {
  api_id           = aws_apigatewayv2_api.http_api.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.redirect_lambda.invoke_arn
}

resource "aws_apigatewayv2_route" "redirect_route" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "GET /{code}"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

resource "aws_lambda_permission" "api_gw" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.redirect_lambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http_api.execution_arn}/*/*"
}

output "api_endpoint" {
  value = aws_apigatewayv2_api.http_api.api_endpoint
}
