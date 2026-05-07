export class UpdateEnquiryDto {
  name?: string;
  email?: string;
  phone?: string;
  description?: string;
  serviceId?: string;
  status?: 'NEW' | 'IN_PROGRESS' | 'CLOSED';
}