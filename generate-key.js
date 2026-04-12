export default function handler(req, res) {
  // CORS para acesso do frontend
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { id } = req.query;

  if (!id || isNaN(id) || parseInt(id) <= 0) {
    return res.status(400).json({ error: 'ID inválido ou ausente' });
  }

  const userId = parseInt(id);
  const hoje = new Date();

  // Cálculo: (ID × 80) + (40 ÷ 3)
  const resultado = (userId * 80) + (40 / 3);

  const dia = hoje.getDate();
  const mes = hoje.getMonth() + 1;
  const ano = hoje.getFullYear();

  // Arredonda para 2 casas decimais e substitui ponto por underline
  const resultadoFormatado = resultado.toFixed(2).replace('.', '_');

  // Formato final: DD_MM_RESULTADO
  const key = `${dia}_${mes}_${resultadoFormatado}`;

  console.log(`[KEY-SYSTEM] Gerado para user ${userId} em ${dia}/${mes}/${ano}: ${key}`);

  return res.status(200).json({
    key,
    userId,
    formula: `${userId} × 80 + 40 ÷ 3`,
    data: `${dia}/${mes}/${ano}`,
    timestamp: Date.now()
  });
}
