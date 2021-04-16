async function main() {
    switch (network.name) {
        case 'rinkeby':
          console.log("this is rinkeby");
          break;
        case 'mumbai':
            console.log("this is mumbai");
            break;
    }
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });