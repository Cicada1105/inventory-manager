import Link from 'next/link'

export default function PagePreview({ name, page }) {
	// Store the keys of an object; this will be used as the table headers
	let headers = Object.keys(page[0]);
	let colWidth = (90 / headers.length).toFixed(2);
	return (
		<>
			<h1 className="text-center mt-3 text-3xl font-bold underline">{ name }</h1>
	  		<Link href={`/${name}/list`}>View More</Link>
			<table className="table-fixed m-auto" style={{ width: "90%" }}>
				<thead>
				  <tr>
				  {
				  	headers.map((header, i) => <th key={i} style={{ width: `${colWidth}%` }}>{ 
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
					page.map((data,i) => 
						<tr key={i}>
							{
								Object.values(data).map((cellData,i) => <td key={i} className="break-words w-min">{cellData === null ? "" : cellData.toString()}</td>)
							}
						</tr>
					)
				}
				</tbody>
			</table>
		</>
	);
}