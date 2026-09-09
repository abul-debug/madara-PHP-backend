const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
  try {
    // Secret link Environment Variable se aayega (code mein nahi likha)
    const SECRET_URL = process.env.SECRET_HTML_URL;

    if (!SECRET_URL) {
      return res.status(500).send('Secret URL not configured');
    }

    const response = await axios.get(SECRET_URL, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    const $ = cheerio.load(response.data);

    // Saari images ke src ko apne proxy se replace kar do
    $('img').each((i, el) => {
      let src = $(el).attr('src');
      if (src) {
        // Relative URL ko absolute banao
        const absoluteSrc = new URL(src, SECRET_URL).href;
        $(el).attr('src', `/api/proxy-image?url=${encodeURIComponent(absoluteSrc)}`);
      }
    });

    // Agar background-image CSS mein hain to unhe bhi handle kar sakte ho (optional)

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send($.html());
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to load content');
  }
};
