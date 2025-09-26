import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sgMail from '@sendgrid/mail';

@Injectable()
export class EmailService {
    private fromEmail: string;

    constructor(private configService: ConfigService) {
        const apiKey = this.configService.get<string>('SENDGRID_API_KEY');
        this.fromEmail = this.configService.get<string>('SENDGRID_FROM_EMAIL') ?? '';

        if (!apiKey) {
            throw new Error('SENDGRID_API_KEY is not set in environment variables');
        }
        sgMail.setApiKey(apiKey);
    }

    // Generic method to send email
    async sendEmail(to: string | string[], subject: string, html: string) {
        const msg = {
            to,
            from: this.fromEmail,
            subject,
            html,
        };

        return sgMail.send(msg);
    }

    // Password reset email
    async sendResetPasswordEmail(to: string, token: string) {
        const appUrl = this.configService.get<string>('APP_URL');
        const resetLink = `${appUrl}/reset-password?token=${token}&email=${encodeURIComponent(to)}`;

        const html = `
      <p>Hello,</p>
      <p>You requested a password reset.</p>
      <p>Click the link below to reset your password. This link will expire in 5 minutes:</p>
      <a href="${resetLink}">${resetLink}</a>
      <br/><br/>
      <p>If you did not request this reset, you can safely ignore this email.</p>
      <p>Thanks,<br/>Ecommerce Web App</p>
    `;

        return this.sendEmail(to, 'Password Reset Request', html);
    }

    // Restaurant admin creation email
    async sendRestaurantAdminCreationEmail(
        restaurantAdminEmail: string,
        password: string,
        superAdminEmails: string | string[],
    ) {
        const htmlForAdmin = `
      <p>Hello,</p>
      <p>Congratulations for joining Food Web Platform<p>
      <p>Your Restaurnat credentials are as follow</p>
      <p>Email: ${restaurantAdminEmail}</p>
      <p>Password: ${password}</p>
      <br/>
      <p>Thanks,<br/>Ecommerce Web App</p>
    `;

        const htmlForSuperAdmin = `
      <p>Hello Super Admin,</p>
      <p>A new Restaurant Admin account has been created.</p>
      <p>Email: ${restaurantAdminEmail}</p>
      <p>Password: ${password}</p>
      <br/>
      <p>Thanks,<br/>Ecommerce Web App</p>
    `;

        // Send to restaurant admin
        await this.sendEmail(restaurantAdminEmail, 'Your Restaurant Admin Account', htmlForAdmin);

        // Send to super admin(s)
        if (superAdminEmails) {
            await this.sendEmail(
                superAdminEmails,
                'New Restaurant Admin Account Created',
                htmlForSuperAdmin,
            );
        }
    }

    // Super Admin Creation Email
    async sendSuperAdminCreationEmail(
        superAdminEmail: string,
        password: string,
        createdByEmail: string,
    ) {
        const htmlForSuperAdmin = `
      <p>Hello,</p>
      <p>Welcome to the Food Web Platform.</p>
      <p>Your Super Admin account has been created successfully. Below are your credentials:</p>
      <p><b>Email:</b> ${superAdminEmail}</p>
      <p><b>Password:</b> ${password}</p>
      <br/>
      <p>Please change your password after logging in for the first time.</p>
      <br/>
      <p>Thanks,<br/>Ecommerce Web App</p>
    `;

        const htmlForCreator = `
      <p>Hello,</p>
      <p>You have successfully created a new Super Admin account.</p>
      <p><b>Email:</b> ${superAdminEmail}</p>
      <br/>
      <p>Thanks,<br/>Ecommerce Web App</p>
    `;

        // sending to new Super Admin
        await this.sendEmail(
            superAdminEmail,
            'Your Super Admin Account Created',
            htmlForSuperAdmin,
        );

        // sending to account creator admin
        if (createdByEmail) {
            await this.sendEmail(createdByEmail, 'New Super Admin Account Created', htmlForCreator);
        }
    }
}
