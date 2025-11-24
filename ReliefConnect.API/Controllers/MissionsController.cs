using Microsoft.AspNetCore.Mvc;
using ReliefConnect.API.Models;
using System.Text;
using System.Text.Json;

namespace ReliefConnect.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MissionsController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<MissionsController> _logger;

        public MissionsController(IHttpClientFactory httpClientFactory, ILogger<MissionsController> logger)
        {
            _httpClient = httpClientFactory.CreateClient("Supabase");
            _logger = logger;
        }

        [HttpPost("accept/{requestId}")]
        public async Task<IActionResult> AcceptMission(Guid requestId, [FromBody] Guid donorId)
        {
            try
            {
                var options = new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower
                };

                // Get request
                var getResponse = await _httpClient.GetAsync($"/rest/v1/relief_requests?id=eq.{requestId}");
                var requestJson = await getResponse.Content.ReadAsStringAsync();
                var requests = JsonSerializer.Deserialize<List<ReliefRequest>>(requestJson, options);
                var request = requests?.FirstOrDefault();
                
                if (request == null) return NotFound("Request not found.");
                if (request.Status != 0) return BadRequest("Request is already taken or completed.");

                // Update request status
                var updateData = new { status = 1 }; // InProgress
                var updateJson = JsonSerializer.Serialize(updateData, options);
                var updateContent = new StringContent(updateJson, Encoding.UTF8, "application/json");
                await _httpClient.PatchAsync($"/rest/v1/relief_requests?id=eq.{requestId}", updateContent);

                // Create mission
                var mission = new ReliefMission
                {
                    RequestId = requestId,
                    DonorId = donorId,
                    StartedAt = DateTime.UtcNow
                };

                var missionJson = JsonSerializer.Serialize(mission, options);
                var missionContent = new StringContent(missionJson, Encoding.UTF8, "application/json");
                missionContent.Headers.Add("Prefer", "return=representation");
                
                var missionResponse = await _httpClient.PostAsync("/rest/v1/relief_missions", missionContent);
                var responseBody = await missionResponse.Content.ReadAsStringAsync();
                
                _logger.LogInformation("Mission response: {Status}, body: {Body}", 
                    missionResponse.StatusCode, responseBody);
                
                if (missionResponse.IsSuccessStatusCode && !string.IsNullOrEmpty(responseBody))
                {
                    var result = JsonSerializer.Deserialize<ReliefMission[]>(responseBody, options);
                    return Ok(result?.FirstOrDefault() ?? mission);
                }
                
                return Ok(mission); // Return the mission we created even if response is empty
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error accepting mission");
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("complete/{missionId}")]
        public async Task<IActionResult> CompleteMission(Guid missionId)
        {
            try
            {
                var options = new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower
                };

                // Get mission
                var getResponse = await _httpClient.GetAsync($"/rest/v1/relief_missions?id=eq.{missionId}");
                var missionJson = await getResponse.Content.ReadAsStringAsync();
                var missions = JsonSerializer.Deserialize<List<ReliefMission>>(missionJson, options);
                var mission = missions?.FirstOrDefault();
                
                if (mission == null) return NotFound("Mission not found.");

                // Update mission
                var updateMissionData = new { completed_at = DateTime.UtcNow };
                var updateMissionJson = JsonSerializer.Serialize(updateMissionData, options);
                var updateMissionContent = new StringContent(updateMissionJson, Encoding.UTF8, "application/json");
                await _httpClient.PatchAsync($"/rest/v1/relief_missions?id=eq.{missionId}", updateMissionContent);

                // Update request
                var updateRequestData = new { status = 2 }; // Completed
                var updateRequestJson = JsonSerializer.Serialize(updateRequestData, options);
                var updateRequestContent = new StringContent(updateRequestJson, Encoding.UTF8, "application/json");
                await _httpClient.PatchAsync($"/rest/v1/relief_requests?id=eq.{mission.RequestId}", updateRequestContent);

                return Ok(mission);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error completing mission");
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}
