FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY Educator.sln ./
COPY src/Educator.Api/Educator.Api.csproj src/Educator.Api/
COPY src/Educator.Application/Educator.Application.csproj src/Educator.Application/
COPY src/Educator.Domain/Educator.Domain.csproj src/Educator.Domain/
COPY src/Educator.Infrastructure/Educator.Infrastructure.csproj src/Educator.Infrastructure/

RUN dotnet restore src/Educator.Api/Educator.Api.csproj

COPY . .
RUN dotnet publish src/Educator.Api/Educator.Api.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish .

ENTRYPOINT ["sh", "-c", "ASPNETCORE_URLS=http://0.0.0.0:${PORT:-8080} dotnet Educator.Api.dll"]
