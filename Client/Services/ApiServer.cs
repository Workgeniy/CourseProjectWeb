namespace Client.Services {
    public class ApiServer {

        private readonly HttpClient server;

        public ApiServer (IHttpClientFactory httpClient) {
            server = httpClient.CreateClient("ServerAPI");
        }

        public async Task<string> GetDataAsyns () {
            var responce = await server.GetAsync("data");
            responce.EnsureSuccessStatusCode();
            return await responce.Content.ReadAsStringAsync();
        }

    }
}
