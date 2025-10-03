// Dummy CreditService - No credit system in this app
class CreditService {
  async getBalance() {
    return { credits: 999999 };
  }

  async getUsage() {
    return [];
  }
}

export const creditService = new CreditService();
export default creditService;
