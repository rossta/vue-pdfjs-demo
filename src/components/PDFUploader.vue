<template>
  <section class="form">
    <a href="#" class="btn" @click.prevent.stop="openPicker">Upload</a>
    <span>or</span>
    <label class="url">Enter a PDF url
      <input v-model="url" />
    </label>
    <p v-if="error" class="error">
      {{error}}
    </p>
  </section>
</template>

<script>
let fsClient;
function getClient() {
  if (fsClient) {
    return Promise.resolve(fsClient);
  } else {
    return import(
      /* webpackChunkName: "filestack" */
      'filestack-js'
      ).then(({default: filestack}) => {
      return filestack.init(process.env.VUE_APP_FILESTACK_KEY);
    })
  }
}

export default {
  props: {
    documentError: {
      type: String,
      default: ''
    },
  },
  data() {
    return {
      url: undefined,
      urlError: undefined,
    };
  },
  watch: {
    url(value) {
      const URL_REGEX = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/
      if (!value) {
        this.urlError = undefined;
        return;
      }

      if (URL_REGEX.exec(value)) {
        this.url = value;
        this.urlError = undefined;
      }
      else {
        this.url = undefined;
        this.urlError = 'Please enter a valid url';
      }
      if (this.url) {
        this.$emit('updated', this.url);
      }
    },
  },
  computed: {
    error() {
      return this.documentError || this.urlError;
    },
  },
  methods: {
    openPicker() {
      getClient().then((client) => {
        client.pick({
          fromSources:["local_file_system","imagesearch","facebook","instagram","dropbox"],
          accept:[".pdf"],
          maxFiles:1,
          maxSize:10240000,
        }).then(response => this.handleFilestack(response));
      })
    },

    handleFilestack(response) {
      if (response.filesUploaded.length > 0) {
        const [file] = response.filesUploaded;
        this.url = file.url;
      }
    },
  },
};
</script>

<style scoped>
.form {
  font-family: Monaco, 'Courier New', Courier, monospace;
  margin-bottom: 2em;
  display: block;
}
span, label {
  color: white;
  font-weight: bold;
  margin-left: 0.5em;
}
.form input {
  width: 33%;
  padding: 0.25em;
  font-size: 1em;
}
.error {
  border: 1px solid red;
  background: pink;
  color: red;
  padding: 0.5em 3em;
  display: inline;
}
button {
  display: inline;
  padding: 0.5em;
  font-size: 1em;
}
a.btn {
  display: inline;
  padding: 0.5em 3em;
  background: rgb(41, 177, 41);
  border: 1px solid white;
  text-decoration: none;
  border-radius: 3px;
  color: white;
  font-weight: bold;
}
</style>
