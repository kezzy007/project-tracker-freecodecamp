replaceDotsInEmailName = (email) => {
    const terminator = '@';

    email.replace(/./, (character) => {

        if(character !== terminator && character === '.') {
            return '';
        }

    });

};

module.exports = replaceDotsInEmailName;