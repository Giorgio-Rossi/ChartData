    // Random number function
        function generateRandom(min , max) {
            let difference = max - min;
            let rand = Math.random();
            rand = Math.floor( rand * difference);
          rand = rand + min;
          return rand;
          }
		  
		  function generateRandomExlude(min, max, exlude) {
			var num = Math.floor(Math.random() * (max - min + 1)) + min;

			
			
		return (exlude.includes(num)) ? generateRandomExlude(min, max, exlude) : num;
}
  