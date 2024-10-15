import { ApiProperty } from '@nestjs/swagger';

export class JwtDTO {
  @ApiProperty({
    description: 'JWT access token used for authenticating API requests',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;
}
