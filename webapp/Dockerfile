FROM node:16 as frontend-builder
WORKDIR /app
COPY frontend/package.json ./
COPY frontend/package-lock.json ./
RUN npm ci
COPY frontend .
RUN npm run build


FROM python:3.9
WORKDIR /app
COPY backend/requirements.txt ./
RUN pip3 install -r requirements.txt
COPY backend .
COPY --from=frontend-builder /app/build /app/static

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "wsgi:app"]