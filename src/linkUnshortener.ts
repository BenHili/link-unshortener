import axios from "axios";

const redirect_codes = [301, 303];

const fetch = async (
  link: string,
  statusCode: number = 301,
  path: string[] = []
): Promise<void> => {
  if (!redirect_codes.includes(statusCode) || !link) {
    console.log(path);
    return;
  }

  await axios
    .get(link, {
      maxRedirects: 0,
      validateStatus: (code: number): boolean => code < 400,
      timeout: 10000
    })
    .then(({ headers, status }) => {
      return fetch(headers.location, status, [
        ...path,
        ...(headers.location ? [headers.location] : [])
      ]).catch(error => {
        console.error(error);
      });
    });
};

fetch(process.argv[2]);
