using System.Text.Json.Serialization;

namespace ReliefConnect.API.Models
{
    public enum RequestStatus { Open = 0, InProgress = 1, Completed = 2, Cancelled = 3 }

    public class ReliefRequest
    {
        [JsonPropertyName("id")]
        public Guid Id { get; set; } = Guid.NewGuid();

        [JsonPropertyName("requester_id")]
        public Guid RequesterId { get; set; }

        [JsonPropertyName("title")]
        public string Title { get; set; } = string.Empty;

        [JsonPropertyName("description")]
        public string Description { get; set; } = string.Empty;

        [JsonPropertyName("latitude")]
        public double Latitude { get; set; }

        [JsonPropertyName("longitude")]
        public double Longitude { get; set; }

        [JsonPropertyName("address")]
        public string Address { get; set; } = string.Empty;

        [JsonPropertyName("contact_phone")]
        public string? ContactPhone { get; set; }

        [JsonPropertyName("status")]
        public int Status { get; set; } = 0;

        [JsonPropertyName("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [JsonIgnore] // Don't serialize this when posting to Supabase
        public List<RequestItem>? Items { get; set; }
    }
}
