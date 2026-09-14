class Block {
  constructor(index, data, previousHash = '') {
    this.index = index;
    this.date = new Date();
    this.data = data;
    this.previousHash = previousHash;
    this.nonce = 0;
    this.hash = this.createHash();
  }
  createHash() {
    return CryptoJS.SHA256(this.index + this.date + this.data + this.previousHash + this.nonce).toString();
  }
  mine(dif) {
    while (!this.hash.startsWith(dif)) { this.nonce++; this.hash = this.createHash(); }
  }
}

class BlockChain {
  constructor(genesis, dif = '00') {
    this.chain = [new Block(0, genesis)];
    this.dif = dif;
  }
  addBlock(data) {
    const prev = this.chain[this.chain.length - 1];
    const b = new Block(prev.index + 1, data, prev.hash);
    b.mine(this.dif);
    this.chain.push(b);
  }
  updateBlock(index, data) {
    this.chain.find(b => b.index === index).data = data; // no recalcula el hash a propósito
  }
  deleteBlock(index) {
    this.chain = this.chain.filter(b => b.index !== index);
  }
  isValid() {
    for (let i = 1; i < this.chain.length; i++) {
      if (this.chain[i].hash !== this.chain[i].createHash()) return { ok: false, i };
      if (this.chain[i].previousHash !== this.chain[i - 1].hash) return { ok: false, i };
    }
    return { ok: true };
  }
}