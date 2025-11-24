using System.Text.Json.Serialization;

namespace ReliefConnect.API.Models
{
    public class User
    {
        [JsonPropertyName("id")]
        public Guid Id { get; set; } = Guid.NewGuid();

        [JsonPropertyName("full_name")]
        public string FullName { get; set; } = string.Empty;

        [JsonPropertyName("phone_number")]
        public string PhoneNumber { get; set; } = string.Empty;

        [JsonPropertyName("password_hash")]
        public string PasswordHash { get; set; } = string.Empty;

        [JsonPropertyName("role")]
        public string Role { get; set; } = "Requester";

        [JsonPropertyName("is_verified")]
        public bool IsVerified { get; set; } = false;
    }
}
