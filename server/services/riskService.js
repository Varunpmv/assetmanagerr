class RiskService {
  constructor() {
    this.weights = {
      criticality: { 'Low': 1, 'Medium': 2, 'High': 3, 'Critical': 5 },
      data_sensitivity: { 'Public': 1, 'Internal': 2, 'Confidential': 3, 'Restricted': 5 }
    };
  }

  calculateScore(asset) {
    const critWeight = this.weights.criticality[asset.criticality] || 2;
    const sensWeight = this.weights.data_sensitivity[asset.data_sensitivity] || 2;
    let score = (critWeight + sensWeight) / 2;
    if (asset.status === 'inactive') score *= 0.5;
    return parseFloat(score.toFixed(2));
  }

  getRiskLevel(score) {
    if (score >= 4.0) return 'Critical';
    if (score >= 3.0) return 'High';
    if (score >= 2.0) return 'Medium';
    return 'Low';
  }
}

module.exports = new RiskService();
