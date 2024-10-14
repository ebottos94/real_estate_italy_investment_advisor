FROM python:3.10
WORKDIR /code
COPY ./requirements.txt requirements.txt
RUN pip install -r requirements.txt
COPY . .
CMD ["fastapi", "dev", "main.py", "--host", "0.0.0.0", "--port", "8000"]