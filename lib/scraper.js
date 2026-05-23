import axios from "axios";
import * as cheerio from "cheerio";
export const scrapeResults = async () => {

  const urls = [
    "https://www.mumresults.in/",
    "https://www.mumresults.in/ugnepresults.html",
    "https://www.mumresults.in/revalresults.html",
    "https://www.mumresults.in/grievance_sh25/index.html",
  ];

  const results = [];

  for (const url of urls) {

    try {

      const response = await axios.get(url);

      const $ = cheerio.load(response.data);

      $(".tablecontents table tbody tr").each(
        (index, row) => {

          const date = $(row)
            .find("td")
            .last()
            .text()
            .trim();

          $(row)
            .find("a")
            .each((i, linkElement) => {

              const title = $(linkElement)
                .text()
                .trim();

              const link = $(linkElement)
                .attr("href");

              if (
                link &&
                link.includes(".pdf")
              ) {

                results.push({
                  title,
                  date,
                  pdfUrl: link.startsWith("http")
                    ? link
                    : `https://www.mumresults.in/${link}`,
                });

              }
            });
        }
      );

    } catch (error) {

      console.log(
        `Failed scraping ${url}:`,
        error.message
      );

    }
  }

  return results;
};