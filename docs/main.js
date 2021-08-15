window.$docsify = {
    el: "#app",
    loadSidebar: true,
    name: '',
    repo: '',
    homepage: "README.md",
    vueComponents: {
        'button-counter': {
            template: `
        <button @click="count += 1">
          You clicked me {{ count }} times
        </button>
      `,
            data() {
                return {
                    count: 0,
                };
            },
        },
    },
}
