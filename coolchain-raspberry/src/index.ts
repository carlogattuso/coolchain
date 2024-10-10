import { BlockchainService } from './services/blockchain.service';
import { config } from './config/config';

(async () => {
  const service = new BlockchainService();
  setInterval(async () => await service.storeRecord(), config.sampleInterval);
})();