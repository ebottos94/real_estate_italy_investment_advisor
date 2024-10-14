from fastapi import APIRouter, HTTPException
from services.services import get_values, validate_region, check_url

IMMOBILIARE_URL = "https://www.immobiliare.it/mercato-immobiliare/"

router = APIRouter()

"""
Check if a city have areas values
"""


@router.get("/deep-values/")
async def deep_values(region: str, province: str, city: str):
    if not validate_region(region):
        raise HTTPException(status_code=400, detail="The region requested is wrong")
    url_province = f"{IMMOBILIARE_URL}{region}/{province.split('-provincia')[0]}/"
    url_city = f"{IMMOBILIARE_URL}{region}/{city}/"
    return check_url(url_province=url_province, url_city=url_city)


"""
Values of all Italy Regions
"""


@router.get("/italy-prices/")
async def italy_prices():
    url = IMMOBILIARE_URL
    return get_values(url=url)


"""
Values of a Region
"""


@router.get("/region-prices/")
async def region_prices(region: str):
    if not validate_region(region):
        raise HTTPException(status_code=400, detail="The region requested is wrong")
    url = IMMOBILIARE_URL + region
    return get_values(url=url)


"""
Values of a Province
"""


@router.get("/province-prices/")
async def province_prices(region: str, province: str):
    if not validate_region(region):
        raise HTTPException(status_code=400, detail="The region requested is wrong")
    url = f"{IMMOBILIARE_URL}{region}/{province}"
    return get_values(url=url)


"""
Values of a City
"""


@router.get("/city-prices/")
async def city_prices(region: str, city: str):
    if not validate_region(region):
        raise HTTPException(status_code=400, detail="The region requested is wrong")
    url = f"{IMMOBILIARE_URL}{region}/{city}"
    return get_values(url=url)
