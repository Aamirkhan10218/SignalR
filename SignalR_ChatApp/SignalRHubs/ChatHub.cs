using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;

namespace SignalR_ChatApp.SignalRHubs
{
    public class ChatHub : Hub
    {
        public Task SendMessageToAll(string message)
        {
            return  Clients.All.SendAsync("ReceiveMessage", message);
        }
    }
}
