import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { WorkerService } from './worker.service';

@Controller()
export class WorkerController {
  constructor(private readonly workerService: WorkerService) {}

  @EventPattern('fb-messages')
  async handleFacebookMessage(@Payload() message: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await this.workerService.handleFacebookMessage(message);
  }
}
