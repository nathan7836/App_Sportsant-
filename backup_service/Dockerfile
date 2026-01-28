FROM alpine:latest

# Install sqlite and coreutils (for date/find)
RUN apk add --no-cache sqlite coreutils tzdata

# Set Timezone to Europe/Paris
ENV TZ=Europe/Paris

WORKDIR /app

COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

# Create volume mount points
VOLUME /data
VOLUME /backups

CMD ["./entrypoint.sh"]
