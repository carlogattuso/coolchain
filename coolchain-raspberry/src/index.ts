import { BlockchainService } from './services/blockchain.service';
import { config } from './config/config';

(async () => {
  const service = new BlockchainService();
  await service.storeRecord();
  setInterval(() => service.storeRecord(), config.sample_interval);
})();