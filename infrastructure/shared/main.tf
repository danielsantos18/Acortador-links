provider "aws" {
  region = "us-east-2"
}

resource "aws_dynamodb_table" "url_shortener_table" {
  name           = "UrlShortenerTable"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "shortCode"

  attribute {
    name = "shortCode"
    type = "S"
  }

  tags = {
    Environment = "Production"
    Project     = "UrlShortener"
  }
}

output "table_name" {
  value = aws_dynamodb_table.url_shortener_table.name
}

output "table_arn" {
  value = aws_dynamodb_table.url_shortener_table.arn
}
