import { join } from 'node:path';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AuthModule } from './auth/auth.module';
import { AutomationModule } from './modules/automation/automation.module';
import { CrmWorkspaceModule } from './modules/crm-workspace/crm-workspace.module';
import { IntakeModule } from './modules/intake/intake.module';
import { MessageTemplatesModule } from './modules/message-templates/message-templates.module';
import { SalesSettingsModule } from './modules/sales-settings/sales-settings.module';
import { InquiriesModule } from './modules/inquiries/inquiries.module';
import { LeadsModule } from './modules/leads/leads.module';
import { MediaModule } from './modules/media/media.module';
import { NavigationModule } from './modules/navigation/navigation.module';
import { PublicSiteModule } from './modules/public-site/public-site.module';
import { ServicesModule } from './modules/services/services.module';
import { PagesModule } from './modules/pages/pages.module';
import { SeoModule } from './modules/seo/seo.module';
import { SettingsModule } from './modules/settings/settings.module';
import { RevalidationModule } from './modules/revalidation/revalidation.module';
import { CrmUsersModule } from './modules/crm-users/crm-users.module';
import { PrismaModule } from './prisma/prisma.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads/',
    }),
    PrismaModule,
    AuthModule,
    SalesSettingsModule,
    AutomationModule,
    IntakeModule,
    CrmWorkspaceModule,
    MessageTemplatesModule,
    PagesModule,
    ServicesModule,
    LeadsModule,
    InquiriesModule,
    SettingsModule,
    NavigationModule,
    SeoModule,
    MediaModule,
    PublicSiteModule,
    RevalidationModule,
    CrmUsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
