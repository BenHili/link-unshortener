import axios, { AxiosResponse } from "axios";

const redirect_codes = [301, 303];

const fetch = async (
  link: string,
  statusCode: number = 301,
  path: string[] = [link]
): Promise<void> => {
  if (!redirect_codes.includes(statusCode) || !link) {
    console.log(path);
    return;
  }

  await axios
    .get(link, {
      maxRedirects: 1,
      validateStatus: (code: number): boolean => code < 400,
      timeout: 10000,
    })
    .then(({ data, headers, status }: AxiosResponse) => {
      let match: string;

      const urlParamRegex = /(url=)(.*?)(?:'|,|"|\n)/;

      const headerMatches = JSON.stringify(headers).match(urlParamRegex);
      const dataMatches = JSON.stringify(data).match(urlParamRegex);

      if (headerMatches && headerMatches.length > 2) {
        match = headerMatches[2];
      } else if (dataMatches && dataMatches.length > 2) {
        match = dataMatches[2];
      }

      const url: string = headers.location ? headers.location : match;

      return fetch(url, status, [...path, ...(url ? [url] : [])]).catch(
        (error) => {
          console.error(error);
        }
      );
    });
};

fetch(process.argv[2]);
