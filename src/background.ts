function Background() {
  chrome.commands.onCommand.addListener((command) => {
    console.log(`Command: ${command}`);//
    alert(command)
  });
}

export default Background
