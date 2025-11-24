using Microsoft.AspNetCore.Mvc;
using ReliefConnect.API.Models;
using System.Text;
using System.Text.Json;

namespace ReliefConnect.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RequestsController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<RequestsController> _logger;

        public RequestsController(IHttpClientFactory httpClientFactory, ILogger<RequestsController> logger)
        {
            _httpClient = httpClientFactory.CreateClient("Supabase");
            _logger = logger;
        }

        [HttpPost]
        public async Task<IActionResult> CreateRequest(ReliefRequest request)
        {
            try
            {
                // Ensure created_at is in ISO 8601 format
                request.CreatedAt = DateTime.UtcNow;
                request.Status = 0; // Open
                
                var options = new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower
                };
                
                var json = JsonSerializer.Serialize(request, options);
                _logger.LogInformation("Sending request to Supabase: {Json}", json);
                
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                content.Headers.Add("Prefer", "return=representation");
                
                var response = await _httpClient.PostAsync("/rest/v1/relief_requests", content);
                var responseBody = await response.Content.ReadAsStringAsync();
                
                _logger.LogInformation("Supabase response status: {Status}, body: {Body}", 
                    response.StatusCode, responseBody);
                
                if (response.IsSuccessStatusCode)
                {
                    var result = JsonSerializer.Deserialize<ReliefRequest[]>(responseBody, options);
                    return Ok(result?.FirstOrDefault());
                }
                
                return BadRequest(new { error = "Failed to create request", details = responseBody });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating request");
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetRequests([FromQuery] int? status)
        {
            var url = status.HasValue 
                ? $"/rest/v1/relief_requests?status=eq.{status.Value}"
                : "/rest/v1/relief_requests";
                
            var response = await _httpClient.GetAsync(url);
            var result = await response.Content.ReadAsStringAsync();
            
            var options = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower
            };
            
            var requests = JsonSerializer.Deserialize<List<ReliefRequest>>(result, options);
            return Ok(requests);
        }
    }
}
