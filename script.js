const placeholderProjects = [
  {
    title: 'AIチャットUI（仮）',
    summary: '顧客サポート向けに設計した日本語チャット体験の試作。'
  },
  {
    title: '要約パイプライン（仮）',
    summary: '長文レポートを自動要約するワークフローの検証版。'
  },
  {
    title: 'プロンプト評価セット（仮）',
    summary: '回答品質を比較するための評価観点とサンプル集。'
  }
];

const container = document.querySelector('#project-grid');

placeholderProjects.forEach((project) => {
  const card = document.createElement('article');
  card.className = 'card';
  card.innerHTML = `<h3>${project.title}</h3><p>${project.summary}</p>`;
  container.appendChild(card);
});
