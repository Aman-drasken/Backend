export class CreateEnquiryDto {
  name: string;
  email: string;
  phone?: string;
  description?: string;
  serviceId: string;
}