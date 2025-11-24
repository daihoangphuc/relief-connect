using Microsoft.AspNetCore.Mvc;
using ReliefConnect.API.Models;
using System.Text;
using System.Text.Json;

namespace ReliefConnect.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _config;

        public AuthController(IHttpClientFactory httpClientFactory, IConfiguration config)
        {
            _httpClient = httpClientFactory.CreateClient("Supabase");
            _config = config;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(User user)
        {
            // Check if phone number exists
            var checkUrl = $"/rest/v1/users?phone_number=eq.{user.PhoneNumber}";
            var checkResponse = await _httpClient.GetAsync(checkUrl);
            var existingUsers = await checkResponse.Content.ReadAsStringAsync();
            
            if (existingUsers != "[]")
            {
                return BadRequest("Phone number already exists.");
            }

            // Insert new user
            var json = JsonSerializer.Serialize(user);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync("/rest/v1/users", content);
            
            if (response.IsSuccessStatusCode)
            {
                var result = await response.Content.ReadAsStringAsync();
                return Ok(JsonSerializer.Deserialize<User>(result));
            }
            
            return BadRequest("Registration failed.");
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var url = $"/rest/v1/users?phone_number=eq.{request.PhoneNumber}&password_hash=eq.{request.Password}";
            var response = await _httpClient.GetAsync(url);
            var result = await response.Content.ReadAsStringAsync();
            
            var users = JsonSerializer.Deserialize<List<User>>(result);
            var user = users?.FirstOrDefault();
            
            if (user == null)
            {
                return Unauthorized("Invalid credentials.");
            }
            return Ok(user);
        }
    }

    public class LoginRequest
    {
        public string PhoneNumber { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
