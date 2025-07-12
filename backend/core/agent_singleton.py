from chat.agent import GitHubRepoAssistant

_github_agent = None

def get_agent():
    """Get the shared GitHubRepoAssistant instance"""
    global _github_agent
    if _github_agent is None:
        _github_agent = GitHubRepoAssistant()
    return _github_agent