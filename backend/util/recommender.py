from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.metrics.pairwise import cosine_similarity
from util import csvParser
import torch


#Process the data to appropriate format
def Recommender(Movie_idx, movie_factors, number, data):
    
    # Compute cosine similarity
    similarities = cosine_similarity(movie_factors[Movie_idx].unsqueeze(0), movie_factors).flatten()

    # Sort by similarity score in descending order
    rec_indices = similarities.argsort()[::-1][1:number+1]  
    #remove the original title
    rec_indices = [idx for idx in rec_indices if data.iloc[idx]['title'] != data.iloc[Movie_idx]['title']]
    
    # Get corresponding similarity scores
    rec_scores = similarities[rec_indices]
    return rec_indices, rec_scores

#Process data to Pytorch Format
def processData(data):
    tfidf = TfidfVectorizer(max_features=500)
    #convert content describtion to numeric values
    encoded_content = tfidf.fit_transform(data["content"]).toarray()
    
    #encoding genres and companies for ML purposes
    encoded_genres = MultiLabelBinarizer().fit_transform(data['genres'])
    encoded_companies = MultiLabelBinarizer().fit_transform(data['production_companies'])

    #Change the all factors to pytorch format
    genres = torch.tensor(encoded_genres, dtype=torch.float32)
    companies = torch.tensor(encoded_companies, dtype=torch.float32)
    content = torch.tensor(encoded_content, dtype=torch.float32)
    movie_factors = torch.cat([genres, companies, content], dim=1)
    return movie_factors

#Make top movie recommendations recommendations based on the vote average and popularity
def TopRecommendations(data,recommendations,score,num):
    #Find the corresponding movies
    recommended_movies = data.iloc[recommendations].copy()
    recommended_movies['Sim_Score'] = score
    recommended_movies['Score'] = ((0.15*recommended_movies['vote_average']) + (0.15*recommended_movies['popularity']))+(0.7*recommended_movies["Sim_Score"])

    recommendations = recommended_movies.sort_values(by='Score', ascending=False).head(num)['title'].to_numpy()

    return recommendations

#Make top movie recommendations recommendations based on the vote average and popularity
def TopScore(data,recommendations,score,num):
    #Find the corresponding movies
    recommended_movies = data.iloc[recommendations].copy()
    recommended_movies['Sim_Score'] = score

    recommendations = recommended_movies.sort_values(by='Sim_Score', ascending=False).head(num)['Sim_Score'].to_numpy()
    avg_score = recommendations.mean()
    return avg_score

#Use to initialize the data and create Movie_factor.pt   
def initdata():
    #Obatin data by parsing csv file
    data = csvParser.ParseMovieData()
    #Parse movie data
    movie_factors = processData(data)
    # Save the precomputed movie_factors
    torch.save(movie_factors, "Movie_factor.pt")
    return data

#Make Movie recommednations
def MakeRecommendation(data,movie_title):
    movie_idx = title_idx_conversion(data,movie_title)
    if movie_idx == None:
        return None
    # Later, we load the precomputed data and generate recommendations
    precomputed_factors = torch.load("Movie_factor.pt",weights_only=True)
    recommended_indices,sim_score = Recommender(Movie_idx=movie_idx, movie_factors=precomputed_factors, number=10, data=data)

    recommended_movies = TopRecommendations(data,recommended_indices,sim_score,5)
    
    return recommended_movies

#To get the average score of each sample size
def GetScore(data,sample_size):
    result = []
    for n in sample_size:
        sampled_data = data.sample(n=n, random_state=42).index.to_list()
        total = 0
        for sample_idx in sampled_data:
            movie_idx = sample_idx
            # Later, we load the precomputed data and generate recommendations
            precomputed_factors = torch.load("Movie_factor.pt",weights_only=True)
            recommended_indices,sim_score = Recommender(Movie_idx=movie_idx, movie_factors=precomputed_factors, number=10, data=data)

            total += TopScore(data,recommended_indices,sim_score,5)
        result.append(total/len(sampled_data))
    
    return result

#Find the movie Title
def title_idx_conversion(data, title):
    indices = data.index[data['title'].str.lower() == title.lower()].tolist()
    return indices[0] if indices else None
    
