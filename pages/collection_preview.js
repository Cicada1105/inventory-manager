import Link from 'next/link'

export default function PagePreview({ name, page }) {
	let headers = (page.length > 0) ? Object.keys(page[0]) : [];
	// Remove all fields that have "id" in the title, password column and restrictions column removing respective columns
	let filteredHeaders = headers.filter(header => {
		if (header.includes("id") || header.includes("password") || header.includes('restrictions'))
			page.forEach(data => delete data[header]);
		else
			return header;
	});
	let colWidth = (page.length > 0) && (90 / filteredHeaders.length).toFixed(2);

	return (
		<>
			<h1 className="text-center mt-3 text-3xl font-bold underline">{
				name.split("_").map(w => {
		  			let letters = w.split("");
		  			let splicedArray = letters.splice(0,1);

		  			let firstLetterToUpper = splicedArray[0]?.toUpperCase();
		  			let restOfWord = letters.join("");

		  			return restOfWord.length > 0 ? firstLetterToUpper.concat(restOfWord) : firstLetterToUpper;
				}).join(" ")
			}</h1>
	  		<Link href={`/${name}/list`}>View More</Link>
	  		{
	  			page.length === 0 ? 
	  			<h2 className="text-lg text-center">No Work Orders</h2> :
				<table className="table-fixed m-auto" style={{ width: "90%" }}>
					<thead>
					  <tr>
					  {
					  	filteredHeaders.map((header, i) => <th key={i} style={{ width: `${colWidth}%` }}>{ 
					  		header.split("_").map(w => { 
					  			let letters = w.split("");
					  			let splicedArray = letters.splice(0,1);

					  			let firstLetterToUpper = splicedArray[0]?.toUpperCase();
					  			let restOfWord = letters.join("");

					  			return restOfWord.length > 0 ? firstLetterToUpper.concat(restOfWord) : firstLetterToUpper;
					  		}).join(" ") 
					  	}</th>)
					  }
					  </tr>
					</thead>
					<tbody>
					{
						(page.length > 0) && page.map((data,i) => 
							<tr key={i}>
								{
									Object.values(data).map((cellData,i) => <td key={i} className="break-words w-min">{
										cellData === null ? "" : cellData.toString()
									}</td>)
								}
							</tr>
						)
					}
					</tbody>
				</table>
	  		}
		</>
	);
}