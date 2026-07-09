FROM maven:3.9.9-eclipse-temurin-21 AS builder
WORKDIR /workspace

COPY . .
RUN chmod +x mvnw && ./mvnw -q -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app

RUN addgroup --system spring && adduser --system --ingroup spring spring
COPY --from=builder /workspace/target/olimpiadas-peru-*.jar /app/app.jar

USER spring:spring
ENV SERVER_PORT=8080
EXPOSE 8080

ENTRYPOINT ["sh", "-c", "PORT_VALUE=${SERVER_PORT:-${PORT:-8080}}; echo \"Starting on port $PORT_VALUE\"; exec java $JAVA_OPTS -jar /app/app.jar --server.port=$PORT_VALUE"]
