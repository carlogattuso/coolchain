import { BlockchainService } from './services/blockchain.service';

(async () => {
  const coolchainService = new BlockchainService();
  setInterval(() => coolchainService.storeRecord(), 10000);
})();