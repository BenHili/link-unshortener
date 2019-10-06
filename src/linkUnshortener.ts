import axios from 'axios'

const redirect_codes = [301, 303]

const fetch = async (link: string, statusCode: number = 301, redirects: number = 0, path: string[] = []): Promise<string[]> => {
  if (redirects > (process.env.MAX_REDIRECTS || 10)) {
    throw badRequest('Exceeded maximum redirects for link')
  }

  if (!redirect_codes.includes(statusCode) || !link) {
    return path
  }

  try {
    const { headers, status } = await axios.get(link, {
      maxRedirects: 0,
      validateStatus: (code: number): boolean => code < 400,
      timeout: parseInt(process.env.FOLLOW_REDIRECT_TIMEOUT || '10000', 10)
    })
    return fetch(headers.location, status, redirects++, [...path, ...(headers.location ? [headers.location] : [])])
  } catch (err) {
    if (err.code === 'ECONNABORTED') {
      return path
    } else {
      throw err
    }
  }
}

export default fetch

