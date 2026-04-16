import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { query } = req.query

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Missing query parameter' })
  }

  try {
    const response = await fetch(
      `https://expediente.mec.gub.uy/APPS/FILECENTER/CONSULTAWEB2.NSF/BuscarExpediente?OpenAgent&query=${encodeURIComponent(query)}`
    )

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Error from MEC server' })
    }

    const data = await response.json()
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate')
    return res.status(200).json(data)
  } catch {
    return res.status(500).json({ error: 'Failed to fetch from MEC' })
  }
}
