export * from './hEARTBaseAPIs.service';
import { HEARTBaseAPIsService } from './hEARTBaseAPIs.service';
export * from './pilotRestController.service';
import { PilotRestControllerService } from './pilotRestController.service';
export const APIS = [HEARTBaseAPIsService, PilotRestControllerService];
