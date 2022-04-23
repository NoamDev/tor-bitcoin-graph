FROM python:3.9
COPY backend /app
WORKDIR /app
RUN pip3 install -r requirements.txt

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "wsgi:app"]