import licences from '../../design/public-photo-licenses.json';

export function GET() {
  return new Response(JSON.stringify({project: 'Kořeny osobností', derivatives: licences.derivatives}, null, 2),
    {headers: {'Content-Type': 'application/json; charset=utf-8'}});
}
