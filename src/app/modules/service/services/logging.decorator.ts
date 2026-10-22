import { UserEventsLogService } from './user-events-log.service';
import { AppModule } from 'src/app/app.module';
import { USER_EVENT_CONSTANTS } from '@config/user-events.conf';

export function LogEvent(eventType: USER_EVENT_CONSTANTS) {
  return function (target: any, key: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      try {
        const logger =
          AppModule.injector.get<UserEventsLogService>(UserEventsLogService);
        logger.logEvent(eventType, {
          component: target.constructor.name,
          method: key,
        });
      } catch (e) {
        console.warn('LoggingService not available', e);
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
