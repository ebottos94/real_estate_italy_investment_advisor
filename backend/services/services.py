from bs4 import BeautifulSoup
import os
import requests

"""
Scrape values and return : 
- ratio between rent price and sell price (the metric)
- names of Areas (Regions, Provinces, Cities, Areas of City)
- Sell price
- Rent price
- 'value' a variable to identify Immobiliare url value
"""


def get_values(url: str) -> dict:
    r = requests.get(url=url)
    soup = BeautifulSoup(r.text, "html.parser")
    table = soup.find("table", class_="nd-table nd-table--borderBottom")
    trs = table.findChildren("tr")

    result = []
    for i in range(1, len(trs)):
        a = trs[i].find("td").find("a")
        tds = trs[i].find_all("td")
        try:
            sell_price = int(tds[1].text.replace(".", ""))
            rent_price = float(tds[2].text.replace(",", "."))
        except:
            next
        # Obtain ratio between rent price and sell price
        ratio = rent_price / sell_price
        value = {
            "name": a.text,
            "value": a["href"].split("/")[-2],
            "ratio": ratio * 1000,  # multiply by 1000 to obtain nicer metric
            "rent_price": rent_price,
            "sell_price": sell_price,
        }
        result.append(value)

    result = sorted(result, key=lambda d: d["ratio"], reverse=True)

    return {"values": result}


"""
Check if is Italian Region 
"""


def validate_region(region: str) -> bool:
    path = os.path.join(os.getcwd(), "italian_regions.txt")
    with open(path) as f:
        regions = [
            line.rstrip().lower().replace(" ", "-").replace("'", "-") for line in f
        ]
    if not region in regions:
        return False
    return True


"""
Comparate urls, the goal is to see if city have also areas values
"""


def check_url(url_province: str, url_city: str) -> bool:
    r = requests.get(url=url_city)
    soup = BeautifulSoup(r.text, "html.parser")
    table = soup.find("table", class_="nd-table nd-table--borderBottom")
    trs = table.findChildren("tr")
    if trs[1].find("td").find("a")["href"] == url_province:
        return False
    return True
