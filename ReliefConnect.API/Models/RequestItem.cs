using System.Text.Json.Serialization;

namespace ReliefConnect.API.Models
{
    public class RequestItem
    {
        [JsonPropertyName("id")]
        public Guid Id { get; set; } = Guid.NewGuid();

        [JsonPropertyName("request_id")]
        public Guid RequestId { get; set; }

        [JsonPropertyName("item_name")]
        public string ItemName { get; set; } = string.Empty;

        [JsonPropertyName("quantity_needed")]
        public int QuantityNeeded { get; set; }

        [JsonPropertyName("unit")]
        public string Unit { get; set; } = string.Empty;
    }
}
