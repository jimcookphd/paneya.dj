Paneya desktop v0.4

1. Upload desktop.css and desktop.js to the ROOT of the GitHub repository.
2. Add this line immediately before </head> in index.html:
   <link rel="stylesheet" href="./desktop.css">
3. Add this line immediately before </body> in index.html:
   <script src="./desktop.js" defer></script>
4. Commit. Keep player.js, playlist.json and style.css unchanged.
5. Refresh the site with Ctrl+Shift+R.

Drag the VT100 terminal by its title bar. Its position is stored in localStorage.

Note: Webamp is rendered into its own dynamically created #webamp root, so its
existing independent window dragging is unchanged. If the terminal overlaps
Winamp, drag the terminal elsewhere.
