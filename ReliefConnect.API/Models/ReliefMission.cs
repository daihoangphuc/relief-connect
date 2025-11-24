using System.Text.Json.Serialization;

namespace ReliefConnect.API.Models
{
    public class ReliefMission
    {
        [JsonPropertyName("id")]
        public Guid Id { get; set; } = Guid.NewGuid();

        [JsonPropertyName("request_id")]
        public Guid RequestId { get; set; }

        [JsonPropertyName("donor_id")]
        public Guid DonorId { get; set; }

        [JsonPropertyName("started_at")]
        public DateTime StartedAt { get; set; } = DateTime.UtcNow;

        [JsonPropertyName("completed_at")]
        public DateTime? CompletedAt { get; set; }

        [JsonPropertyName("proof_image")]
        public string? ProofImage { get; set; }
    }
}
