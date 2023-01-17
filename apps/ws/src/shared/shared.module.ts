import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import {
  DalService,
  UserRepository,
  OrganizationRepository,
  EnvironmentRepository,
  NotificationTemplateRepository,
  SubscriberRepository,
  NotificationRepository,
  MessageRepository,
  MemberRepository,
} from '@novu/dal';
import { AnalyticsService } from '@novu/application-generic';

import { QueueService } from './queue';
import { SubscriberOnlineService } from './subscriber-online';

export const ANALYTICS_SERVICE = 'AnalyticsService';

const DAL_MODELS = [
  UserRepository,
  OrganizationRepository,
  EnvironmentRepository,
  NotificationTemplateRepository,
  SubscriberRepository,
  NotificationRepository,
  MessageRepository,
  MemberRepository,
];

const dalService = new DalService();

const PROVIDERS = [
  {
    provide: QueueService,
    useFactory: () => {
      return new QueueService();
    },
  },
  {
    provide: DalService,
    useFactory: async () => {
      await dalService.connect(process.env.MONGO_URL as string);

      return dalService;
    },
  },
  ...DAL_MODELS,
  SubscriberOnlineService,
  {
    provide: AnalyticsService,
    useFactory: async () => {
      const analyticsService = new AnalyticsService();

      await analyticsService.initialize(process.env.SEGMENT_TOKEN);

      return analyticsService;
    },
  },
];

@Module({
  imports: [
    JwtModule.register({
      secretOrKeyProvider: () => process.env.JWT_SECRET as string,
      signOptions: {
        expiresIn: 360000,
      },
    }),
  ],
  providers: [...PROVIDERS],
  exports: [...PROVIDERS, JwtModule],
})
export class SharedModule {}
