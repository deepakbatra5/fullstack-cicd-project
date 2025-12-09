variable "aws_region" {
  type        = string
  default     = "us-east-1"
}

variable "instance_type" {
  type        = string
  default     = "t3.micro"
}

variable "key_name" {
  type        = string
  description = "EC2 Key Pair name"
}

variable "ami_id" {
  type        = string
  description = "Ubuntu 22.04 AMI ID for your region"
}
